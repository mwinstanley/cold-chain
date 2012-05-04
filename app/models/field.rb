class Field < ActiveRecord::Base
  attr_accessible :name, :vaccine_file_id

  def self.find_or_create(name)
    field = Field.find_by_name(name)
    if field.nil?
      field = Field.create!({:name => name})
    end
    field
  end









  def as_json(options = nil)
    self.name
  end
end
