class UserOptionsController < ApplicationController

  def create
    logger.info "Creating a new user options with params " + params["data"]
    data = ActiveSupport::JSON.decode(params["data"])
    update_type = params["type"]
    opt = UserOptions.new
    if update_type == "files"
      opt.update_files(data["facility"], data["fridge"], data["schedule"])
    end
    opt.save
#    options = do_update(nil, data["files"], data["fields"], data["values"])
#    options = UserOptions.create_with_files(data["main"],
#                                      data["fridge"],
#                                      data["schedule"])
    redirect_to "/?id=" + opt.id.to_s
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
    update_type = params["type"]
    opt = UserOptions.find_by_id(params["id"])
    if update_type == "files"
      opt.update_files(data["facility"], data["fridge"], data["schedule"])
    elsif update_type == "fields"
      opt.update_fields(data["facility"], data["fridge"], data["schedule"])
    elsif update_type == "gps"
      opt.update_attributes(:lat => data["lat"],
                            :lon => data["lon"],
                            :is_utm => data["is_utm"])
    end
    opt.save
    redirect_to "/?id=" + opt.id.to_s
  end

  def do_update(id, files, fields, values)
    options = UserOptions.find_by_id(id)
    if options.nil?
      options = UserOptions.new
    end
    if !files.nil?
    end
    if !fields.nil?
      options.update_fields(fields["facility"], fields["fridge"], fields["schedule"])
    end
    if !values.nil?
      options.update_values(values["facility"], values["fridge"], values["schedule"])
    end
    options.save
    options
  end

end
