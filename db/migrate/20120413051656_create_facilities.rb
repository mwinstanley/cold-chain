class CreateFacilities < ActiveRecord::Migration
  def change
    create_table :facilities do |t|
      t.string :facility_id
      t.string :file_name

      t.timestamps
    end
  end
end
