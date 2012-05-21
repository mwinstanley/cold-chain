class ValueOption < ActiveRecord::Base
  attr_accessible :value_id, :field_option_id, :name

  belongs_to :field_option
  belongs_to :value




  def as_json(options = nil)
    hash = self.name
    hash
  end

  def self.create_from_hash(hash, fo)
    create! do |value|
      value.value = Value.find_or_create(hash["id"])
      value.color = hash["color"]
      value.name = hash["name"]
      value.field_option = fo
    end
  end
end
