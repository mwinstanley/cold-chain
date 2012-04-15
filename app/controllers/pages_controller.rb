class PagesController < ApplicationController
  def home
    @id = params[:id]
    @user_options = UserOptions.find_by_id(@id)
    if @user_options.nil?
      @user_options = UserOptions.new
    end
    @file_property = FileProperty.new
  end

  def map

  end

end
