class Value < ActiveRecord::Base
  attr_accessible :name

  def self.find_or_create(name)
    value = Value.find_by_name(name)
    if value.nil?
      value = Value.create!({:name => name})
    end
    value
  end




  def as_json(options = nil)
    self.name
  end


end
