class CreateVaccineFiles < ActiveRecord::Migration
  def self.up
    create_table :vaccine_files do |t|
      t.string :name
    end
  end

  def self.down
    drop_table :vaccine_files
  end
end
