class CreateValues < ActiveRecord::Migration
  def change
    create_table :values do |t|
      t.string :val

      t.timestamps
    end
  end
end
