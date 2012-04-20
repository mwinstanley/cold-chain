class Value < ActiveRecord::Base
  attr_accessible :val

  has_many :features
  has_many :value_options

  def as_json(options = nil)
    self.val
  end

  def self.find_or_create(val)
    value = Value.find_by_val(val)
    if value.nil?
      value = Value.create!({:val => val})
    end
    value
  end

end
