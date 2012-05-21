class UserOptions < ActiveRecord::Base
  attr_accessible :name, :lat, :lon, :is_utm, :south_hemi, :zone, :lat_center, :lon_center

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
    if !fridge.nil?
      fridge_options.update_field_options(fridge)
      fridge_options.save
    end
    if !schedules.nil?
      schedule_options.update_field_options(schedules)
      schedule_options.save
    end
  end

  def update_values(main, fridge, schedules)
    logger.debug "values update for options"
    if !main.nil?
      facility_options.update_value_options(main)
      facility_options.save
    end
    if !fridge.nil?
      fridge_options.update_value_options(fridge)
      fridge_options.save
    end
    if !schedules.nil?
      schedule_options.update_value_options(schedules)
      schedule_options.save
    end
  end

  def update_info_box(params)
    if (info_box)
      info_box.delete
    end
    info_box = InfoBox.create!( { :title_field => params["title_field"],
                                  :data => params["fields"],
                                  :user_options => self } )
  end

  def update_displays(display_type, data)
    Display.delete_all(["display_type = ? AND user_options_id = ?",
                         display_type, self.id])
    data.each do |d|
      displays << Display.create!( { :data => d , :display_type => display_type} )
    end
  end

  def as_json(options = nil)
    hash = { "facility" => facility_options.as_json,
             "fridge" => fridge_options.as_json,
             "schedule" => schedule_options.as_json,
             "lat" => lat,
             "lon" => lon,
             "is_utm" => is_utm,
             "south_hemi" => south_hemi,
             "zone" => zone,
             "lat_center" => lat_center,
             "lon_center" => lon_center,
             "info_box" => info_box.as_json }
    d_types = ["map", "filter", "pie"]
    d_types.each do |t|
      hash[t] = {}
      Display.getDisplays(self.id, t).each do |d|
        hash[t][d.data[0]] = d.data
      end
    end
    hash
  end
end
