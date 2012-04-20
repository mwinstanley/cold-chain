class DisplayType < ActiveRecord::Base
  attr_accessible :str

  def as_json(options = nil)
    str
  end

  has_many :field_options

  def self.find_or_create(val)
    dt = self.find_by_str(val)
    if dt.nil?
      dt = self.create!(:str => val)
    end
    dt
  end

end
