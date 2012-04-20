class Facility < ActiveRecord::Base
  attr_accessible :facility_id, :file_name

  has_many :feature_sets, :dependent => :destroy

  def self.find_or_create_from_row(name, row, join_main, join_secondary, f_type)
    facility = Facility.find(:all,
                  :conditions => ["facility_id = ? AND file_name = ?", row[join_secondary], name])[0]
    if facility.nil?
      facility = create! do |facility|
        facility.facility_id = row[join_main]
        facility.file_name = name
      end
    end
    facility.feature_sets << FeatureSet.create_from_row(row, f_type)
  end

  def self.get_feature_headers
    hash = {}

    for name in ["main", "fridge", "schedule"] do
      set = Facility.first.find_by_name(name)[0]
      if !set.nil?
        hash[name] = set.fields
      end
    end

    hash
  end

  def self.get_all_facilities(opt)
    file_name = opt.get_main_file_props[0].name
    facilities = Facility.find_by_file(file_name)
    hash = []
    for f in facilities do
      hash << f.as_json
    end
    hash
  end

  def as_json(options = nil)
    hash = { "main" => find_by_name("main")[0].as_json,
             "fridge" => find_by_name("fridge")[0].as_json,
             "schedules" =>
                 find_by_name("schedule").map { |s| s.as_json } }
    hash
  end

  def find_by_name(name)
    FeatureSet.find(:all,
                    :conditions=>["facility_id = ? AND name = ?",
                        self.id, name])
  end

  def self.find_by_file(file)
    Facility.find(:all,
                  :conditions=>["file_name = ?", file])
  end
end
