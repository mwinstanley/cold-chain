class CreateFacilities < ActiveRecord::Migration
  def self.up
    create_table :facilities do |t|
      t.integer :vaccine_file_id
    end
  end

  def self.down
    drop_table :facilities
  end
end
