class CreateSchedules < ActiveRecord::Migration
  def self.up
    create_table :schedules do |t|
      t.references :vaccine_file
    end
  end

  def self.down
    drop_table :schedules
  end
end
