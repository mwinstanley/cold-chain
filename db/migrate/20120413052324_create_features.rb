class CreateFeatures < ActiveRecord::Migration
  def change
    create_table :features do |t|
      t.string :field_id
      t.string :value_id
      t.integer :feature_set_id

      t.timestamps
    end
  end
end
