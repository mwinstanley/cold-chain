class VaccineFile < ActiveRecord::Base

  has_many :fields

  def self.find_or_create(name)
    f = VaccineFile.find_by_name(name)
    if f.nil?
      f = VaccineFile.create!({ :name => name })
    end
    f
  end
end
