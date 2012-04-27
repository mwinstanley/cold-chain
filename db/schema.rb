# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20120427062459) do

  create_table "facilities", :force => true do |t|
    t.integer "vaccine_file_id"
  end

  create_table "facility_options", :force => true do |t|
    t.string  "file_name"
    t.string  "main_col"
    t.integer "user_options_id"
  end

  create_table "features", :force => true do |t|
    t.integer "field_id"
    t.integer "value_id"
    t.integer "owning_object_id"
    t.string  "owning_object_type"
  end

  create_table "field_options", :force => true do |t|
    t.integer "info_options_id"
    t.string  "info_options_type"
    t.integer "field_id"
    t.string  "readable_name"
    t.string  "field_type"
  end

  create_table "fields", :force => true do |t|
    t.string "name"
  end

  create_table "fridge_options", :force => true do |t|
    t.string  "file_name"
    t.string  "main_col"
    t.string  "join_main"
    t.integer "user_options_id"
  end

  create_table "fridges", :force => true do |t|
    t.integer "file_id"
  end

  create_table "info_boxes", :force => true do |t|
    t.string  "title_field"
    t.integer "user_options_id"
  end

  create_table "info_boxes_fields", :id => false, :force => true do |t|
    t.integer "info_box_id"
    t.integer "field_id"
  end

  add_index "info_boxes_fields", ["info_box_id", "field_id"], :name => "index_info_boxes_fields_on_info_box_id_and_field_id"

  create_table "schedule_options", :force => true do |t|
    t.text    "file_names"
    t.text    "file_readable_names"
    t.string  "main_col"
    t.string  "join_main"
    t.integer "user_options_id"
  end

  create_table "schedules", :force => true do |t|
    t.integer "file_id"
  end

  create_table "user_options", :force => true do |t|
    t.string  "name"
    t.string  "lat"
    t.string  "lon"
    t.boolean "is_utm"
  end

  create_table "vaccine_files", :force => true do |t|
    t.string "name"
  end

  create_table "value_options", :force => true do |t|
    t.integer "value_id"
    t.integer "field_option_id"
    t.string  "name"
  end

  create_table "values", :force => true do |t|
    t.string "name"
  end

end
