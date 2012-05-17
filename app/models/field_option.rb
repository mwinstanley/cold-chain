class FieldOption < ActiveRecord::Base
  attr_accessible :field, :readable_name, :field_type

  belongs_to :info_options, :polymorphic => true
  belongs_to :field

  has_many :value_options
  has_many :values, :through => :value_options

  def as_json(options = nil)
    hash = { "readable_name" => readable_name,
             "field_type" => field_type }
    vals = {}
    for v in value_options do
      vals[v.value.name] = v.as_json
    end
    hash["value_options"] = vals
    hash
  end

  def self.create_with_hash(hash, parent, file_name)
    file_id = VaccineFile.find_by_name(file_name).id
    create! do |fo|
      fo.field_id = Field.find(:all, :conditions => ["name = ? AND vaccine_file_id = ?", hash["name"], file_id]).first.id
      fo.readable_name = hash["readable_name"]
      fo.field_type = hash["field_type"]
      fo.info_options = parent
    end
  end
end
