'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      // Um usuário pode ter muitos imóveis
      Users.hasMany(models.Imovel, {
        foreignKey: 'usuario_id',
        as: 'imoveis'
      });

      // Um usuário pode ter muitas locações (como locatário)
      Users.hasMany(models.Locacao, {
        foreignKey: 'usuario_id',
        as: 'locacoes'
      });
    }

    async validarSenha(senhaDigitada) {
      return await bcrypt.compare(senhaDigitada, this.senha);
    }
  }

  Users.init({
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true }
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: {
          args: /^\d{11}$/,
          msg: 'O CPF deve conter 11 dígitos numéricos'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Email inválido'
        }
      }
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [6],
          msg: 'A senha deve ter pelo menos 6 caracteres'
        }
      }
    },
    tipo_usuario: {
      type: DataTypes.ENUM('locador', 'locatario'),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Users',
    hooks: {
      beforeCreate: async (user, options) => {
        const salt = await bcrypt.genSalt(10);
        user.senha = await bcrypt.hash(user.senha, salt);
      },
      beforeUpdate: async (user, options) => {
        if (user.changed('senha')) {
          const salt = await bcrypt.genSalt(10);
          user.senha = await bcrypt.hash(user.senha, salt);
        }
      }
    }
  });

  return Users;
};
