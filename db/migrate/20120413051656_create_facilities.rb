class CreateFacilities < ActiveRecord::Migration
  def self.up
    create_table :facilities do |t|
      t.reference :vaccine_file
    end
  end

  def self.down
    drop_table :facilities
  end
end
