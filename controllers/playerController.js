const Players = require('../model/player');
const Nations = require('../model/nation');
const Users = require('../model/user');
const jwt = require('jsonwebtoken');
let clubData = [
  { id: '1', name: 'Arsenal' },
  { id: '2', name: 'Manchester United' },
  { id: '3', name: 'Chelsea' },
  { id: '4', name: 'Manchester City' },
  { id: '5', name: 'PSG' },
  { id: '6', name: 'Inter Milan' },
  { id: '7', name: 'Real Madrid' },
  { id: '8', name: 'Barcelona' },
];
let postitionData = [
  { id: '1', name: 'Còn Bảo Hành' },
  { id: '2', name: 'Hết Bảo Hành' },

];
class PlayerController {
  home(req, res, next) {
    if (req.cookies.jwt) {
      jwt.verify(req.cookies.jwt, 'my_secret_key', (err, decoded) => {
        if (err) {
          req.name = undefined;
          req.role = undefined;
          Nations.find({})
            .then((nations) => {
              Players.find({ isCaptain: true })
                .populate('nation', ['name', 'description'])
                .then((players) => {
                  res.render('index', {
                    title: 'The list of Products',
                    players: players,
                    positionList: postitionData,
                    clubList: clubData,
                    nationsList: nations,
                    isLogin: { name: req.name, role: req.role },
                  });
                })
                .catch((err) => {
                  console.log(err);
                  next();
                });
            })
            .catch((err) => {
              console.log(err);
              next();
            });
        } else {
          req.userId = decoded.user.userId;
          req.name = decoded.user.name;
          req.role = decoded.user.role;
          Nations.find({})
            .then((nations) => {
              Players.find({ isCaptain: true })
                .populate('nation', ['name', 'description'])
                .then((players) => {
                  res.render('index', {
                    title: 'The list of Products',
                    players: players,
                    positionList: postitionData,
                    clubList: clubData,
                    nationsList: nations,
                    isLogin: { name: req.name, role: req.role },
                  });
                })
                .catch((err) => {
                  console.log(err);
                  next();
                });
            })
            .catch((err) => {
              console.log(err);
              next();
            });
        }
      });
    } else {
      Nations.find({})
        .then((nations) => {
          Players.find({ isCaptain: true })
            .populate('nation', ['name', 'description'])
            .then((players) => {
              res.render('index', {
                title: 'The list of Products',
                players: players,
                positionList: postitionData,
                clubList: clubData,
                nationsList: nations,
                isLogin: { name: req.name, role: req.role },
              });
            })
            .catch((err) => {
              console.log(err);
              next();
            });
        })
        .catch((err) => {
          console.log(err);
          next();
        });
    }
  }
  dashboard(req, res, next) {
    Promise.all([
      Players.countDocuments({}),
      Nations.countDocuments({}),
      Users.countDocuments({}),
    ])
      .then(([totalPlayers, totalNations, totalUsers]) => {
        res.render('dashboard', {
          title: 'Dashboard',
          totalNations: totalNations,
          totalPlayers: totalPlayers,
          totalUsers: totalUsers,
          isLogin: { name: req.name, role: req.role },
        });
      })
      .catch((err) => {
        console.error(err);
        next();
      });
  }
  index = async function index(req, res, next) {
    const ITEMS_PER_PAGE = 5; // Số lượng players trên mỗi trang
    const page = +req.query.page || 1; // Lấy số trang hiện tại từ query string
    let totalItems; // Tổng số players trong cơ sở dữ liệu
    let totalPages;
    let regex;
    const filter_nation = req.query.nation;
    const filter_position = req.query.position;
    console.log(filter_position, filter_nation);
    if (req.query.name) {
      regex = new RegExp(req.query.name, 'i');
    }
    const nations = await Nations.find();
    if (!req.query.name) {
      if (filter_nation || filter_position) {
        console.log('zo none key');
        var query;
        if (filter_nation != undefined && filter_position != undefined) {
          query = { position: filter_position, nation: filter_nation };
        }
        if (filter_nation == undefined && filter_position != undefined) {
          query = { position: filter_position };
        }
        if (filter_nation != undefined && filter_position == undefined) {
          query = { nation: filter_nation };
        }
        Players.find(query)
          .countDocuments()
          .then((count) => {
            totalItems = count;
            totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE); // Tính tổng số trang
            return Players.find(query)
              .skip((page - 1) * ITEMS_PER_PAGE) // Bỏ qua các players trên trang hiện tại
              .limit(ITEMS_PER_PAGE) // Giới hạn số lượng players trên mỗi trang
              .populate('nation', ['name', 'description'])
              .exec();
          })
          .then((players) => {
            res.render('playerSite', {
              title: 'The list of Products',
              players: players,
              positionList: postitionData,
              clubList: clubData,
              nationsList: nations,
              isLogin: { name: req.name, role: req.role },
              currentPage: page,
              hasNextPage: ITEMS_PER_PAGE * page < totalItems,
              hasPreviousPage: page > 1,
              nextPage: page + 1,
              previousPage: page - 1,
              lastPage: totalPages,
            });
          })
          .catch((err) => {
            console.log(err);
            next();
          });
      } else {
        Players.find()
          .countDocuments()
          .then((count) => {
            totalItems = count;
            totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE); // Tính tổng số trang
            return Players.find()
              .skip((page - 1) * ITEMS_PER_PAGE) // Bỏ qua các players trên trang hiện tại
              .limit(ITEMS_PER_PAGE) // Giới hạn số lượng players trên mỗi trang
              .populate('nation', ['name', 'description'])
              .exec();
          })
          .then((players) => {
            res.render('playerSite', {
              title: 'The list of Products',
              players: players,
              positionList: postitionData,
              clubList: clubData,
              nationsList: nations,
              isLogin: { name: req.name, role: req.role },
              currentPage: page,
              hasNextPage: ITEMS_PER_PAGE * page < totalItems,
              hasPreviousPage: page > 1,
              nextPage: page + 1,
              previousPage: page - 1,
              lastPage: totalPages,
            });
          })
          .catch((err) => {
            console.log(err);
            next();
          });
      }
    } else {
      var query;
      if (filter_nation != undefined && filter_position != undefined) {
        query = {
          name: { $regex: regex },
          position: filter_position,
          nation: filter_nation,
        };
      }
      if (filter_nation == undefined && filter_position == undefined) {
        query = {
          name: { $regex: regex },
        };
      }
      if (filter_nation == undefined && filter_position != undefined) {
        query = { name: { $regex: regex }, position: filter_position };
      }
      if (filter_nation != undefined && filter_position == undefined) {
        query = { name: { $regex: regex }, nation: filter_nation };
      }
      Players.find(query)
        .countDocuments()
        .then((count) => {
          totalItems = count;
          totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE); // Tính tổng số trang
          return Players.find(query)
            .skip((page - 1) * ITEMS_PER_PAGE) // Bỏ qua các players trên trang hiện tại
            .limit(ITEMS_PER_PAGE) // Giới hạn số lượng players trên mỗi trang
            .populate('nation', ['name', 'description'])
            .exec();
        })
        .then((players) => {
          res.render('playerSite', {
            title: 'The list of Products',
            players: players,
            positionList: postitionData,
            clubList: clubData,
            nationsList: nations,
            isLogin: { name: req.name, role: req.role },
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalItems,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: totalPages,
          });
        })
        .catch((err) => {
          console.log(err);
          next();
        });
    }
  };

  // create(req, res, next) {
  //   Nations.find({})
  //     .then((nations) => {
  //       if (nations.length === 0) {
  //         req.flash(
  //           "error_msg",
  //           "Please input data of nations in Database first!!!"
  //         );
  //         return res.redirect("/players");
  //       } else {
  //         var data = {
  //           name: req.body.name,
  //           image:
  //             req.file === undefined
  //               ? ""
  //               : `/images/Players/${req.file.originalname}`,
  //           career: req.body.career,
  //           position: req.body.position,
  //           goals: req.body.goals,
  //           nation: req.body.nation,
  //           isCaptain: req.body.isCaptain === undefined ? false : true,
  //         };
  //         const player = new Players(data);
  //         Players.find({ name: player.name }).then((playerCheck) => {
  //           if (playerCheck.length > 0) {
  //             req.flash("error_msg", "Duplicate player name!");
  //             res.redirect("/players");
  //           } else {
  //             player
  //               .save()
  //               .then(() => res.redirect("/players"))
  //               .catch(next);
  //           }
  //         });
  //       }
  //     })
  //     .catch((err) => {
  //       req.flash("error_msg", "Server Error");
  //       return res.redirect("/players");
  //     });
  // }
  create = async (req, res, next) => {
    const data = {
      name: req.body.name,
      images: req.body.images, // Sử dụng URL của ảnh đã lấy từ Cloudinary
      desc: req.body.desc,
      position: req.body.position,
      price: req.body.price,
      amount: req.body.amount,
      nation: req.body.nation,
      isCaptain: req.body.isCaptain === undefined ? false : true,
    };

    try {
      const nations = await Nations.find({});
      if (nations.length === 0) {
        req.flash(
          'error_msg',
          'Hãy nhập loại sản phẩm!!!'
        );
        return res.redirect('/players');
      }

      const player = new Players(data);
      const playerCheck = await Players.find({ name: player.name });
      if (playerCheck.length > 0) {
        req.flash('error_msg', 'Sản phẩm đã có');
        return res.redirect('/players');
      }
  
      await player.save();
      req.flash('success', 'true'); 
      return res.redirect('/players');
   
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Server Error');
      return res.redirect('/players');
    }
  };

  playerDetail(req, res, next) {
    const playerId = req.params.playerId;
    if (req.cookies.jwt) {
      jwt.verify(req.cookies.jwt, 'my_secret_key', (err, decoded) => {
        if (err) {
          req.name = undefined;
          req.role = undefined;
          Nations.find({})
            .then((nations) => {
              Players.findById(playerId)
                .populate('nation', 'name')
                .then((player) => {
                  res.render('playerDetail', {
                    title: 'Chi tiết của sản phẩm',
                    player: player,
                    positionList: postitionData,
                    clubList: clubData,
                    nationsList: nations,
                    isLogin: { name: req.name, role: req.role },
                  });
                })
                .catch(next);
            })
            .catch(next);
        } else {
          req.userId = decoded.user.userId;
          req.name = decoded.user.name;
          req.role = decoded.user.role;
          Nations.find({})
            .then((nations) => {
              Players.findById(playerId)
                .populate('nation', 'name')
                .then((player) => {
                  res.render('playerDetail', {
                    title: 'Chi tiết của sản phẩm',
                    player: player,
                    positionList: postitionData,
                    clubList: clubData,
                    nationsList: nations,
                    isLogin: { name: req.name, role: req.role },
                  });
                })
                .catch(next);
            })
            .catch(next);
        }
      });
    } else {
      Nations.find({})
        .then((nations) => {
          Players.findById(playerId)
            .populate('nation', 'name')
            .then((player) => {
              res.render('playerDetail', {
                title: 'Chi tiết của sản phẩm',
                player: player,
                positionList: postitionData,
                clubList: clubData,
                nationsList: nations,
                isLogin: { name: req.name, role: req.role },
              });
            })
            .catch(next);
        })
        .catch(next);
    }
  }
  formEdit(req, res, next) {
    const playerId = req.params.playerId;
    Nations.find({})
      .then((nations) => {
        Players.findById(playerId)
          .populate('nation', 'name')
          .then((player) => {
            res.render('editPlayer', {
              title: 'Chi tiết của sản phẩm',
              player: player,
              positionList: postitionData,
              clubList: clubData,
              nationsList: nations,
              isLogin: { name: req.name, role: req.role },
            });
          })
          .catch(next);
      })
      .catch(next);
  }
  edit(req, res, next) {
    var data;
    if (!req.file) {
      data = {
        name: req.body.name,
        images: req.body.images, // Sử dụng URL của ảnh đã lấy từ Cloudinary
        desc: req.body.desc,
        position: req.body.position,
        price: req.body.price,
        amount: req.body.amount,
        nation: req.body.nation,
        isCaptain: req.body.isCaptain === undefined ? false : true,
      };
    } else {
      data = {
        name: req.body.name,
        image: req.body.image, 
        desc: req.body.desc,
        position: req.body.position,
        goals: req.body.goals,
        nation: req.body.nation,
        isCaptain: req.body.isCaptain === undefined ? false : true,
      };
    }
    // Players.find({ name: req.body.name }).then((playerCheck) => {
    //   if (playerCheck.length > 0) {
    //     req.flash("error_msg", "Duplicate player name!");
    //     return res.redirect("/players");
    //   } else {
    Players.updateOne({ _id: req.params.playerId }, data)
      .then(() => {
        req.flash('success', 'true'); 
        res.redirect('/players');
      })
      .catch((err) => {
        console.log('error update: ', err);
        req.flash('error_msg', 'Tên sản phẩm đã có');
        res.redirect(`/players/edit/${req.params.playerId}`);
      });
    //   }
    // });
  }
  delete(req, res, next) {
    Players.findByIdAndDelete({ _id: req.params.playerId })
      .then(() => res.redirect('/players'))
      .catch(next);
  }
}
module.exports = new PlayerController();
