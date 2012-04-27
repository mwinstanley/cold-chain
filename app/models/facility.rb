require 'csv'

class Facility < ActiveRecord::Base
  attr_accessible :vaccine_file_id

  belongs_to :vaccine_file
  has_many :features, :as => :owning_object
  has_many :fields, :through => :features

  def self.create_from_row(file, row)
    logger.debug "here in creation"
    facility = create! do |facility|
      facility.vaccine_file = file
    end
    row.each { |header, value| facility.features <<
      Feature.create!( { :field => Field.find_or_create(header),
                         :value => Value.find_or_create(value) } ) }
    facility
  end

  def self.readFacilitiesFromFile(file_name)
    f = VaccineFile.find_or_create(file_name)
    CSV.foreach(file_name, :headers => true) do |line|
      Facility.create_from_row(f, line)
    end
  end

#  def self.find_or_create_from_main_row(name, row, main_col)
#    facility = Facility.find(:all,
#                  :conditions => ["facility_id = ? AND file_name = ?", row[main_col], name])[0]
#    if facility.nil?
#      facility = create! do |facility|
#        facility.facility_id = row[main_col]
#        facility.file_name = name
#      end
#    end
#    row.each { |header,value| facility.features <<
#      Feature.create!( { :field => Field.find_or_create(header),
#                         :value => Value.find_or_create(value) } ) }
#  end

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
    file_name = opt.facility_options.file_name
    file = VaccineFile.find_by_name(file_name)
    fields = opt.facility_options.fields
    facilities = Facility.find(:all, { :conditions => { :vaccine_file_id => file.id }, :include => { :features => { :field => [], :value => [] } } })
    hash = []
    for f in facilities do
      hash << f.as_json(opt)
    end
    hash
  end

  def as_json(options = nil)
    hash = {}
    features.each do |f|
      hash[f.field.name] = f.value.name
    end
    hash
  end

  def find_by_name(name)
    FeatureSet.find(:all,
                    :conditions=>["facility_id = ? AND name = ?",
                        self.id, name])
  end

  def self.find_by_file(file)
    Facility.find(:all,
                  :conditions=>["vaccine_file_id = ?", file.id])
  end
end
