class CreateFeatureSets < ActiveRecord::Migration
  def change
    create_table :feature_sets do |t|
      t.integer :facility_id
      t.string :name

      t.timestamps
    end
  end
end
