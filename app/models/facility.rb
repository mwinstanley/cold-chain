require 'csv'

class Facility < ActiveRecord::Base
  attr_accessible :vaccine_file_id, :data

  serialize :data
  belongs_to :vaccine_file

#  has_many :features, :as => :owning_object
#  has_many :fields, :through => :features

  def self.create_from_row(file, row)
    logger.debug "here in creation"
    facility = create! do |facility|
      facility.vaccine_file = file
    end
    facility.data = []
    row.each { |header, value| facility.data << (value.nil? ? "" : value) }
    facility.save
    facility
  end

  def self.readFacilitiesFromFile(file_name)
    f = VaccineFile.find_or_create(file_name)
    first = true
    CSV.foreach(file_name, :headers => true) do |line|
      Facility.create_from_row(f, line)
      if first
        line.each { |header, value| Field.create!( { :name => header, :vaccine_file_id => f.id } ) }
        first = false
      end
    end
  end

  def self.get_all_facilities(opt)
    file_name = opt.facility_options.file_name
    file = VaccineFile.find_by_name(file_name)
    fields = opt.facility_options.fields
    facilities = Facility.find(:all, { :conditions => { :vaccine_file_id => file.id } } )
    hash = []
    for f in facilities do
      hash << f.as_json(opt)
    end
    hash
  end

  def as_json(options = nil)
    data
  end

  def self.find_by_file(file)
    Facility.find(:all,
                  :conditions=>["vaccine_file_id = ?", file.id])
  end
end
