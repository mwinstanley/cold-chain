class Fridge < ActiveRecord::Base
  attr_accessible :file_id

  belongs_to :file
  has_many :features

  def self.create_from_row(file, row)
    fridge = new do |facility|
      fridge.file = file
    end
    row.each { |header, value| fridge.features <<
        Feature.new( { :field => Field.find_or_create(header),
                       :value => Value.find_or_create(value) } ) }
    fridge
  end

  def self.readFridgesFromFile(file_name)
    VaccineFile f = VaccineFile.create!( { :name => file_name } )
    CSV.foreach(file_name, :headers => true) do |line|
      Fridge.create_from_row(f, line)
    end
  end
end
