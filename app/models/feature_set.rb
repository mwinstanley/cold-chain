class FeatureSet < ActiveRecord::Base
  attr_accessible nil

  has_many :features, :dependent => :destroy
  has_many :fields, :through => :features
  belongs_to :facility

  def self.create_from_row(row, set_name)
    create! do |feature_set|
      feature_set.name = set_name
      for h in row.headers() do
        feature_set.features << Feature.create!({ :field => Field.find_or_create(h), :value => Value.find_or_create(row[h]) })
      end
    end
  end

  def as_json(options = nil)
    hash = []
    for f in features do
      hash << f.as_json
    end
    hash
  end

end
