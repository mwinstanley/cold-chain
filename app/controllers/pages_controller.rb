class PagesController < ApplicationController
  def home
    @id = params[:id]
    @user_options = UserOptions.find_by_id(@id, :include => { :facility_options => { :field_options => { :field => [] } } })
    if @user_options.nil?
      @user_options = UserOptions.new
    end
    @facility_options = @user_options.facility_options
    if @facility_options.nil?
      @facility_options = FacilityOptions.new
    end
    @fridge_options = @user_options.fridge_options
    if @fridge_options.nil?
      @fridge_options = FridgeOptions.new
    end
    @schedule_options = @user_options.schedule_options
    if @schedule_options.nil?
      @schedule_options = ScheduleOptions.new
    end
    if !@facility_options.file_name.nil?
      f = VaccineFile.find_by_name(@facility_options.file_name)
      facility = Facility.find_by_vaccine_file_id(f)
      if facility.nil?
        #read in facilities
        Facility.readFacilitiesFromFile(@facility_options.file_name)
      end
    end
    facility_file = VaccineFile.find_by_name(@facility_options.file_name)
    @all_facility_fields = facility_file.nil? ? [] : facility_file.fields
    @options_facility_fields = @facility_options.fields.to_a

    if !@fridge_options.file_name.nil?
      f = VaccineFile.find_by_name(@fridge_options.file_name)
      fridge = Fridge.find_by_vaccine_file_id(f)
      if fridge.nil?
        #read in fridges
        Fridge.readFridgesFromFile(@fridge_options.file_name)
      end
    end
    fridge_file = VaccineFile.find_by_name(@fridge_options.file_name)
    @all_fridge_fields = fridge_file.nil? ? [] : fridge_file.fields
    @options_fridge_fields = @fridge_options.fields.to_a

    if !@schedule_options.file_names.nil?
      for file_name in @schedule_options.file_names do
        f = VaccineFile.find_by_name(file_name)
        schedule = Schedule.find_by_vaccine_file_id(f)
        if schedule.nil?
          #read in schedules
          Schedule.readSchedulesFromFile(file_name)
        end
      end
    end
    schedule_file = nil
    if !@schedule_options.file_names.nil?
      schedule_file = VaccineFile.find_by_name(@schedule_options.file_names.first)
    end
    @all_schedule_fields = schedule_file.nil? ? [] : schedule_file.fields
    @options_schedule_fields = @schedule_options.fields.to_a

    # INFO BOX
    @info_box = @user_options.info_box

    # MAP
    @maps = Display.getDisplays(@id, 'map')
    @filters = Display.getDisplays(@id, 'filter')
    @pies = Display.getDisplays(@id, 'pie')
    logger.debug(@options_facility_fields)
  end

  def map
    @id = params["id"]
    @options = UserOptions.find_by_id(params["id"])
    @facility_file = VaccineFile.find_by_name(@options.facility_options.file_name)
    @fridge_file = VaccineFile.find_by_name(@options.fridge_options.file_name)
    if !@options.schedule_options.file_names.nil?
      @a_schedule_file = VaccineFile.find_by_name(@options.schedule_options.file_names.first)
    end

    @user_options = ActiveSupport::JSON.encode(@options)

    @maps = Display.getDisplays(params["id"], 'map')
    @filters = Display.getDisplays(params["id"], 'filter')
    @pies = Display.getDisplays(params["id"], 'pie')

    # Get field indices
    @fields = { "facility" => {},
                "fridge" => {},
                "schedule" => {} }
    index = 0
    @facility_file.fields.each do |f|
      @fields["facility"][f.name] = index
      index = index + 1
    end
    index = 0
    @fridge_file.fields.each do |f|
      @fields["fridge"][f.name] = index
      index = index + 1
    end

    index = 0
    if !@a_schedule_file.nil?
      @a_schedule_file.fields.each do |f|
        @fields["schedule"][f.name] = index
        index = index + 1
      end
    end

    @fields = ActiveSupport::JSON.encode(@fields)
  end

  def facilities
    @id = params["id"]
    @options = UserOptions.find_by_id(params["id"])
    @facility_file = VaccineFile.find_by_name(@options.facility_options.file_name)
    # Facilities
    @facilities = Facility.find_by_file(@facility_file)
    @facilities = @facilities.nil? ? [] : @facilities.as_json
    render :json => @facilities
  end

  def fridges
    @id = params["id"]
    @options = UserOptions.find_by_id(params["id"])
    @fridge_file = VaccineFile.find_by_name(@options.fridge_options.file_name)

    # Fridges
    @fridges = Fridge.find_by_file(@fridge_file)
    @fridges = @fridges.nil? ? [] : @fridges.as_json
    render :json => @fridges
  end

  def schedules
    @id = params["id"]
    @options = UserOptions.find_by_id(params["id"])
    if !@options.schedule_options.file_names.nil?
      @a_schedule_file = VaccineFile.find_by_name(@options.schedule_options.file_names.first)
    end

    # Schedules
    @schedules = {}
    @options.schedule_options.file_names.each do |name|
      file = VaccineFile.find_by_name(name)
      @schedules[file.name] = Schedule.find_by_file(file)
      @schedules[file.name] = @schedules[file.name].nil? ? [] : @schedules[file.name].as_json
    end
    @schedules = ActiveSupport::JSON.encode(@schedules)
    render :json => @schedules
  end
end
