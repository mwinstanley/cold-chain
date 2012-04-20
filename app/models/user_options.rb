class UserOptions < ActiveRecord::Base
  attr_accessible nil

  has_many :file_properties, :dependent => :destroy

  def as_json(options = nil)
    hash = { "main" => find_props_by_name("main")[0].as_json,
             "fridge" => find_props_by_name("fridge")[0].as_json,
             "schedule" =>
                 find_props_by_name("schedule").map { |s| s.as_json } }
    hash
  end

  def get_main_file_props
    find_props_by_name("main")
  end

  def self.create_with_files(main, fridge, schedules)
    create! do |user_options|
      set_files(user_options, fridge, schedules)
    end
  end

  def update_files(main, fridge, schedules)
    logger.debug "file update for options"
    cur_main = find_props_by_name("main")[0]
    if !cur_main.nil? and cur_main.name == main["name"]
      cur_main.update_attributes(:title => main["title"])
      logger.debug cur_main.title
    else
      if !cur_main.nil?
        cur_main.destroy
      end
      file_properties <<
        FileProperty.create_with_hash("main", main, self)
    end
    cur_fridge = find_props_by_name("fridge")[0]
    if !cur_fridge.nil? and cur_fridge.name == fridge["name"]
      cur_fridge.update_attributes(:title => fridge["title"])
    else
      if !cur_fridge.nil?
        cur_fridge.destroy
      end
      file_properties <<
        FileProperty.create_with_hash("fridge", fridge, self)
    end
    cur_scheds = find_props_by_name("schedule")
    for s in cur_scheds do
      logger.debug s.name
      logger.debug schedules
      if !schedules[s.name].nil?
        s.update_attributes(:title => schedules[s.name]["title"])
        schedules[s.name] = nil
      else
        s.destroy
      end
    end
    schedules.each do |s,sched|
      if !sched.nil?
        file_properties <<
          FileProperty.create_with_hash("schedule", sched, self)
      end
    end
    #UserOptions.set_files(self, main, fridge, schedules)
  end

  def update_fields(main, fridge, schedules)
    logger.debug "fields update for options"
    if !main.nil?
      cur_main = find_props_by_name("main")[0]
      cur_main.update_field_options(main)
      cur_main.save
    end
    if !fridge.nil?
      cur_fridge = find_props_by_name("fridge")[0]
      cur_fridge.update_field_options(fridge)
      cur_fridge.save
    end
    if !schedules.nil?
      cur_scheds = find_props_by_name("schedule")[0]
      cur_scheds.update_field_options(schedules)
      cur_scheds.save
    end

    #cur_fridge = find_props_by_name("fridge")[0]
    #if !cur_fridge.nil? and cur_fridge.name == fridge["name"]
    #  cur_fridge.update_attributes(:title => fridge["title"])
    #else
    #  if !cur_fridge.nil?
    #    cur_fridge.destroy
    #  end
    #  file_properties <<
    #    FileProperty.create_with_hash("fridge", fridge, self)
    #end
  end

  def update_values(main, fridge, schedules)
    logger.debug "values update for options"
    if !main.nil?
      cur_main = find_props_by_name("main")[0]
      cur_main.update_value_options(main)
      cur_main.save
    end
    if !fridge.nil?
      cur_fridge = find_props_by_name("fridge")[0]
      cur_fridge.update_value_options(fridge)
      cur_fridge.save
    end
    if !schedules.nil?
      cur_scheds = find_props_by_name("schedule")[0]
      cur_scheds.update_value_options(schedules)
      cur_scheds.save
    end
  end

  def find_props_by_name(name)
    FileProperty.find(:all,
                      :conditions => ["user_options_id = ? AND p_type = ?",
                        self.id, name])
  end


  def self.set_files(options, main, fridge, schedules)
    options.file_properties <<
      FileProperty.create_with_hash("fridge", fridge, options)
    for sched in schedules do
      prop = FileProperty.create_with_hash("schedule", sched, options)
      options.file_properties << prop
    end
  end
end
