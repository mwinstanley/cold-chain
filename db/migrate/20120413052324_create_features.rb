class CreateFeatures < ActiveRecord::Migration
  def change
    create_table :features do |t|
      t.string :name
      t.string :value
      t.integer :feature_set_id

      t.timestamps
    end
  end
end
