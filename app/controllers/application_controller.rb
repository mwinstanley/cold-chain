class ApplicationController < ActionController::Base
  protect_from_forgery

  def user_options(id)
    UserOptions.find_by_id(id)
  end

  def get_option_for_field(id, type, field)
    FieldOption.where("field_id = ? AND info_options_id = ? AND info_options_type = ?", field.id, id, type).limit(1)
  end

end
