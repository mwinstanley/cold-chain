class FieldOption < ActiveRecord::Base
  attr_accessible :field, :name, :field_type, :display_type, :in_info_box, :file_property

  belongs_to :file_property
  belongs_to :field
  belongs_to :field_type
  belongs_to :display_type
  has_many :value_options
  has_many :values, :through => :value_options

  def as_json(options = nil)
    hash = { "field" => field.as_json,
             "name" => name,
             "field_type" => field_type.as_json,
             "display_type" => display_type.as_json,
             "in_info_box" => in_info_box }
    vals = {}
    for v in value_options do
      vals[v.value.val] = v.as_json
    end
    hash["value_options"] = vals
    hash
  end

  def set_values(vals, names, colors)
    value_options.destroy_all
    val_parts = vals.split(',')
    names_parts = names.split(',')
    colors_parts = colors.split(',')
    for i in 0..val_parts.length do
      value_options << ValueOption.create!( { :color => colors_parts[i],
          :name => names_parts[i],
          :value => Value.find_or_create(val_parts[i]),
          :field_option => self } )
    end
  end

  def self.create_with_hash(hash, fp)
    create! do |fo|
      fo.field = Field.find_or_create(hash["field"])
      fo.name = hash["name"]
      fo.field_type = FieldType.find_or_create(hash["type"])
      fo.file_property = fp
    end
  end
end
