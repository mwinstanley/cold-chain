class FieldType < ActiveRecord::Base
  attr_accessible :str

  has_many :field_options

  def as_json(options = nil)
    str
  end

  def self.find_or_create(val)
    ft = self.find_by_str(val)
    if ft.nil?
      ft = self.create!(:str => val)
    end
    ft
  end

end
