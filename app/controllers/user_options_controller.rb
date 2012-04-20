class UserOptionsController < ApplicationController

  def create
    logger.info "Creating a new user options with params " + params["data"]
    data = ActiveSupport::JSON.decode(params["data"])
    options = do_update(nil, data["s"], data["f"], data["v"])
#    options = UserOptions.create_with_files(data["main"],
#                                      data["fridge"],
#                                      data["schedule"])
    render :json => options.id
#    render "pages#home"
#    respond_to do |fmt|
#      fmt.js
#    end
  end

  def show
    logger.info "Showing a user options with ID " + params["id"]
    options = UserOptions.find_by_id(params["id"])
    logger.debug  ActiveSupport::JSON.encode(options)
    render :json => ActiveSupport::JSON.encode(options)
  end

  def index
    logger.debug "User options index"
  end

  def update
    logger.info "Updating user options with id " + params["id"]
    data = ActiveSupport::JSON.decode(params["data"])
    options = do_update(params["id"], data["s"], data["f"], data["v"])
    render :json => params["id"]
  end

  def do_update(id, files, fields, values)
    options = UserOptions.find_by_id(id)
    if options.nil?
      options = UserOptions.new
    end
    if !files.nil?
      options.update_files(files["main"], files["fridge"], files["schedule"])
    end
    if !fields.nil?
      options.update_fields(fields["main"], fields["fridge"], fields["schedule"])
    end
    if !values.nil?
      options.update_values
    end
    options.save
    options
  end

end
