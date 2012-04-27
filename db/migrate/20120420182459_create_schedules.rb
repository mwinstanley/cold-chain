class CreateSchedules < ActiveRecord::Migration
  def self.up
    create_table :schedules do |t|
      t.integer :file_id
    end
  end

  def self.down
    drop_table :schedules
  end
end
