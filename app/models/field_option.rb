class FieldOption < ActiveRecord::Base
  attr_accessible :field, :readable_name, :field_type

  belongs_to :info_options, :polymorphic => true
  belongs_to :field

  has_many :value_options
  has_many :values, :through => :value_options

  def as_json(options = nil)
    hash = { "field" => field.as_json,
             "readable_name" => readable_name,
             "field_type" => field_type }
    vals = {}
    for v in value_options do
      vals[v.value.name] = v.as_json
    end
    hash["value_options"] = vals
    hash
  end

  def self.create_with_hash(hash, parent)
    create! do |fo|
      fo.field = Field.find_or_create(hash["name"])
      fo.readable_name = hash["readable_name"]
      fo.field_type = hash["field_type"]
      fo.info_options = parent
    end
  end
end
