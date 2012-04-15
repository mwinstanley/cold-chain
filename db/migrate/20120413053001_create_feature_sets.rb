class CreateFeatureSets < ActiveRecord::Migration
  def change
    create_table :feature_sets do |t|

      t.timestamps
    end
  end
end
