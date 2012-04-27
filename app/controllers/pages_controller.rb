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
    @all_facility_fields = Facility.find_by_vaccine_file_id(facility_file.nil? ? nil : facility_file.id)
    @all_facility_fields = @all_facility_fields.nil? ? [] : @all_facility_fields.fields
    @options_facility_fields = @facility_options.fields.to_a
  end

  def map

  end

end
