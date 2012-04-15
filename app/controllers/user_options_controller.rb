class UserOptionsController < ApplicationController

  def create
    logger.debug "Creating a new user options"
    logger.debug params
    logger.debug ActiveSupport::JSON.decode(params["data"])
    render :json => "201"
#    render "pages#home"
#    respond_to do |fmt|
#      fmt.js
#    end
  end

  def show
    
  end

  def index
    logger.debug "User options index"
  end

  def update
    logger.debug "User options update"
  end

end
