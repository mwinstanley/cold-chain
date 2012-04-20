class Facility < ActiveRecord::Base
  attr_accessible :facility_id

  has_many :feature_sets, :dependent => :destroy

  def self.find_or_create_from_row(row, join_main, join_secondary, f_type)
    facility = Facility.find_by_facility_id(row[join_secondary])
    if facility.nil?
      facility = create! do |facility|
        facility.facility_id = row[join_main]
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


end
