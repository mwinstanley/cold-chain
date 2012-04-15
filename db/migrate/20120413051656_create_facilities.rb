class CreateFacilities < ActiveRecord::Migration
  def change
    create_table :facilities do |t|
      t.string :facility_id
      t.integer :facility_features
      t.integer :fridge_features

      t.timestamps
    end
  end
end
