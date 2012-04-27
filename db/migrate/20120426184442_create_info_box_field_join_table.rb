class CreateInfoBoxFieldJoinTable < ActiveRecord::Migration
  def up
    create_table :info_boxes_fields, :id => false do |t|
      t.references :info_box, :field
    end
    add_index :info_boxes_fields, [:info_box_id, :field_id]
  end

  def down
    drop_table :info_boxes_fields
  end

end
