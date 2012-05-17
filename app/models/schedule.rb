class Schedule < ActiveRecord::Base
  attr_accessible :vaccine_file, :data

  serialize :data
  belongs_to :vaccine_file

  def self.create_from_row(file, row)
    sched = create! do |sched|
      sched.vaccine_file = file
    end
    sched.data = []
    row.each { |header, value| sched.data << (value.nil? ? "" : value) }
    sched.save
    sched
  end

  def self.readSchedulesFromFile(file_name)
    f = VaccineFile.find_or_create(file_name)
    first = true
    CSV.foreach(file_name, :headers => true) do |line|
      Schedule.create_from_row(f, line)
      if first
        line.each { |header, value| Field.create!( { :name => header, :vaccine_file_id => f.id } ) }
        first = false
      end
    end
  end

  def as_json(options = nil)
    data
  end

  def self.find_by_file(file)
    Schedule.find(:all,
                  :conditions=>["vaccine_file_id = ?", file.id])
  end
end
