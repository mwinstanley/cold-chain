class Fridge < ActiveRecord::Base
  attr_accessible :vaccine_file, :data

  serialize :data
  belongs_to :vaccine_file
  def self.create_from_row(file, row)
    fridge = create! do |fridge|
      fridge.vaccine_file = file
    end
    fridge.data = []
    row.each { |header, value| fridge.data << value }
    fridge.save
    fridge
  end

  def self.readFridgesFromFile(file_name)
    f = VaccineFile.find_or_create(file_name)
    first = true
    CSV.foreach(file_name, :headers => true) do |line|
      Fridge.create_from_row(f, line)
      if first
        line.each { |header, value| Field.create!( { :name => header, :vaccine_file_id => f.id } ) }
        first = false
      end
    end
  end
end
