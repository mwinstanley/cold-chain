class CreateInfoBoxes < ActiveRecord::Migration
  def self.up
    create_table :info_boxes do |t|
      t.string :title_field
      t.references :user_options
      t.text :data
    end
  end

  def self.down
    drop_table :info_boxes
  end
end
