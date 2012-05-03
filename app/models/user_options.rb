class UserOptions < ActiveRecord::Base
  attr_accessible :name, :lat, :lon, :is_utm, :south_hemi, :zone

  has_one :info_box, :dependent => :destroy
  has_one :facility_options, :dependent => :destroy
  has_one :fridge_options, :dependent => :destroy
  has_one :schedule_options, :dependent => :destroy
  has_many :displays, :dependent => :destroy

  def update_files(main, fridge, schedules)
    logger.debug "file update for options"
    if !facility_options.nil? and facility_options.file_name == main["file_name"]

    else
      if !facility_options.nil?
        facility_options.destroy
      end
      facility_options = FacilityOptions.create!( { :file_name => main["file_name"],
                                                    :main_col => main["main_col"],
                                                    :user_options => self } )
    end
    if !fridge_options.nil? and fridge_options.file_name == fridge["file_name"]

    else
      if !fridge_options.nil?
        fridge_options.destroy
      end
      fridge_options = FridgeOptions.create!( { :file_name => fridge["file_name"],
                                                :main_col => fridge["main_col"],
                                                :join_main => fridge["join_main"],
                                                :user_options => self } )
    end
    files = []
    files_r = {}
    main_col = ""
    join_main = ""
    logger.debug schedules
    schedules.each do |key,val|
      logger.debug key
      files << key
      files_r[key] = val["file_readable_name"]
      main_col = val["main_col"]
      join_main = val["join_main"]
    end
    if !schedule_options.nil?
      schedule_options.delete
    end
    schedule_options = ScheduleOptions.create( { :file_names => files,
                                                 :file_readable_names => files_r,
                                                 :main_col => main_col,
                                                 :join_main => join_main,
                                                 :user_options => self })
  end

  def update_fields(main, fridge, schedules)
    logger.debug "fields update for options"
    if !main.nil?
      facility_options.update_field_options(main)
      facility_options.save
    end
  end

  def as_json(options = nil)
    hash = { "facility" => facility_options.as_json,
             "fridge" => fridge_options.as_json,
             "schedule" => schedule_options.as_json,
             "lat" => lat,
             "lon" => lon,
             "is_utm" => is_utm }
    hash
  end
end
