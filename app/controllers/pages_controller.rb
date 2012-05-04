class PagesController < ApplicationController
  def home
    @id = params[:id]
    @user_options = UserOptions.find_by_id(@id)
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

  end

  def map
    @user_options = UserOptions.find_by_id(params["id"])
    @facility_file = VaccineFile.find_by_name(@user_options.facility_options.file_name)
    @fridge_file = VaccineFile.find_by_name(@user_options.fridge_options.file_name)
    @facilities = Facility.find_by_file(@facility_file)
    @facilities = @facilities.nil? ? [] : @facilities.as_json
    @user_options = ActiveSupport::JSON.encode(@user_options)

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
    @fields = ActiveSupport::JSON.encode(@fields)
  end

end
