class Feature < ActiveRecord::Base
  attr_accessible :field, :value

  belongs_to :owning_object, :polymorphic => true
  belongs_to :field
  belongs_to :value

  def as_json(options = nil)
    hash = { "field" => field.as_json,
             "value" => value.as_json }
    hash
  end

end
