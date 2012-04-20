class CreateDisplayTypes < ActiveRecord::Migration
  def change
    create_table :display_types do |t|
      t.string :str

      t.timestamps
    end
  end
end
