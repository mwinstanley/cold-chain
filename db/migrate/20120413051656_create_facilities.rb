class CreateFacilities < ActiveRecord::Migration
  def self.up
    create_table :facilities do |t|
      t.references :vaccine_file
      t.text :data
    end
  end

  def self.down
    drop_table :facilities
  end
end
