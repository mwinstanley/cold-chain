class CreateDisplays < ActiveRecord::Migration
  def self.up
    create_table :displays do |t|
      t.references :user_options
      t.text :data
      t.string :name
      t.string :display_type
    end
  end

  def self.down
    drop_table :displays
  end
end
