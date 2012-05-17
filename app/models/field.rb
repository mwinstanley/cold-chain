class Field < ActiveRecord::Base
  attr_accessible :name, :vaccine_file_id

  def self.find_or_create(name, file)
    field = Field.find(:all, :conditions => ["name = ? AND vaccine_file_id = ?", name, file.id])
    if field.nil? || field.empty?
      field = Field.create!({:name => name, :vaccine_file_id => file.id})
    else
      field = field.first
    end
    field
  end









  def as_json(options = nil)
    self.name
  end
end
