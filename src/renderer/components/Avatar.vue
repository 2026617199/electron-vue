<template>
  <div class="menu-container">
    
    <div class="img-wrap">
      <el-dropdown @command="handleCommand" trigger="click">
        <span class="el-dropdown-link">
          <img src="../../assets/headMan.jpg" alt="">
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="center">{{ $t('COMMON.USER_CENTER') }}</el-dropdown-item>
            <el-dropdown-item command="setting">{{ $t('COMMON.MENU.SETTING') }}</el-dropdown-item>
            <el-dropdown-item command="quit">{{ $t('COMMON.MENU.QUIT') }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang='ts'>
import type { Action } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

import { useRouter } from 'vue-router'
const router = useRouter()

const handleCommand = (command: string) => {
  // ElMessage(`click on item ${command}`)
  switch (command) {
    case 'center':
      
      break;
    case 'setting':
      
      break;
    case 'quit':
      router.push({ name: 'LOGIN' })
      break;
  
    default:
      break;
  }
}

</script>

<style lang="scss" scoped>
.img-wrap {
  position: relative;
  text-align: center;
  transition: all .6s;
  img {
    cursor: pointer;
    width: 40px;
    height: 40px;
    margin: 10px 0;
    border-radius: 50%;
    transition: .2s;
    &:hover {
      box-shadow: 0 0 0 1px #000,0 0 0 2px var(--ep-color-primary),0 0 22px 0 var(--ep-color-primary);
    }
  }
  .collapseWidth {
    width: 40px;
    height: 40px;
  }
}
.menu-wrap {
	position: fixed;
  border-radius: 5px;
	background: #fff;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.12);
	-webkit-transition: width 0.3s, height 0.3s;
	transition: width 0.3s, height 0.3s;
	width: 0;
	height: 0;
	// font-size: 1.5em;
	bottom: 1em;
	left: 70px;
  top: 60px;
  z-index: 3;
	-webkit-transform-origin: 0% 0%;
	transform-origin: 0% 0%;
}
.show-menu .menu-wrap {
	width: 100px;
	height: 200px;
	animation: all 0.8s linear forwards;
	-webkit-animation: anim-jelly 0.8s linear forwards;
	animation: anim-jelly 0.8s linear forwards;
}
.show-menu .menu {
	// opacity: 1;
  display: block;
	-webkit-transition: opacity 0.3s 0.3s;
	transition: opacity 0.3s 0.3s;
}
.menu {
	height: 100%;
	// opacity: 0;
  display: none;
  padding: 5px;
	font-size: 0.65em;
	color: #64697d;
	text-align: right;
  .profile {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 5px 0;
    border-bottom: 1px solid #e3e3e3;
    img{
      width: 30px;
      height: 30px;
      border-radius: 50%;
      margin-left: 10px;
    }
  }
  .link-list {
    .menu-item {
      cursor: pointer;
      padding: 10px;
      &:hover {
        background: #e3e3e3;
      }
    }
  }
}

@-webkit-keyframes anim-jelly { 
  0% { -webkit-transform: matrix3d(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  3.333333% { -webkit-transform: matrix3d(0.32778, 0, 0, 0, 0, 0.32778, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.32778, 0, 0, 0, 0, 0.32778, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  6.666667% { -webkit-transform: matrix3d(0.69875, 0, 0, 0, 0, 0.69875, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.69875, 0, 0, 0, 0, 0.69875, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  10% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  13.333333% { -webkit-transform: matrix3d(1.1815, 0, 0, 0, 0, 1.1815, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.1815, 0, 0, 0, 0, 1.1815, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  16.666667% { -webkit-transform: matrix3d(1.24402, 0, 0, 0, 0, 1.24402, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.24402, 0, 0, 0, 0, 1.24402, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  20% { -webkit-transform: matrix3d(1.21871, 0, 0, 0, 0, 1.21871, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.21871, 0, 0, 0, 0, 1.21871, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  23.333333% { -webkit-transform: matrix3d(1.14702, 0, 0, 0, 0, 1.14702, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.14702, 0, 0, 0, 0, 1.14702, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  26.666667% { -webkit-transform: matrix3d(1.06589, 0, 0, 0, 0, 1.06589, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.06589, 0, 0, 0, 0, 1.06589, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  30% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  33.333333% { -webkit-transform: matrix3d(0.9603, 0, 0, 0, 0, 0.9603, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.9603, 0, 0, 0, 0, 0.9603, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  36.666667% { -webkit-transform: matrix3d(0.94663, 0, 0, 0, 0, 0.94663, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.94663, 0, 0, 0, 0, 0.94663, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  40% { -webkit-transform: matrix3d(0.95217, 0, 0, 0, 0, 0.95217, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.95217, 0, 0, 0, 0, 0.95217, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  43.333333% { -webkit-transform: matrix3d(0.96784, 0, 0, 0, 0, 0.96784, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.96784, 0, 0, 0, 0, 0.96784, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  46.666667% { -webkit-transform: matrix3d(0.98559, 0, 0, 0, 0, 0.98559, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.98559, 0, 0, 0, 0, 0.98559, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  50% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  53.333333% { -webkit-transform: matrix3d(1.00868, 0, 0, 0, 0, 1.00868, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.00868, 0, 0, 0, 0, 1.00868, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  56.666667% { -webkit-transform: matrix3d(1.01167, 0, 0, 0, 0, 1.01167, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.01167, 0, 0, 0, 0, 1.01167, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  60% { -webkit-transform: matrix3d(1.01046, 0, 0, 0, 0, 1.01046, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.01046, 0, 0, 0, 0, 1.01046, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  63.333333% { -webkit-transform: matrix3d(1.00703, 0, 0, 0, 0, 1.00703, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.00703, 0, 0, 0, 0, 1.00703, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  66.666667% { -webkit-transform: matrix3d(1.00315, 0, 0, 0, 0, 1.00315, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.00315, 0, 0, 0, 0, 1.00315, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  70% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  73.333333% { -webkit-transform: matrix3d(0.9981, 0, 0, 0, 0, 0.9981, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.9981, 0, 0, 0, 0, 0.9981, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  76.666667% { -webkit-transform: matrix3d(0.99745, 0, 0, 0, 0, 0.99745, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.99745, 0, 0, 0, 0, 0.99745, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  80% { -webkit-transform: matrix3d(0.99771, 0, 0, 0, 0, 0.99771, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.99771, 0, 0, 0, 0, 0.99771, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  83.333333% { -webkit-transform: matrix3d(0.99846, 0, 0, 0, 0, 0.99846, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.99846, 0, 0, 0, 0, 0.99846, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  86.666667% { -webkit-transform: matrix3d(0.99931, 0, 0, 0, 0, 0.99931, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.99931, 0, 0, 0, 0, 0.99931, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  90% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  93.333333% { -webkit-transform: matrix3d(1.00042, 0, 0, 0, 0, 1.00042, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.00042, 0, 0, 0, 0, 1.00042, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  96.666667% { -webkit-transform: matrix3d(1.00056, 0, 0, 0, 0, 1.00056, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.00056, 0, 0, 0, 0, 1.00056, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  100% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);} 
}

@keyframes anim-jelly { 
  0% { -webkit-transform: matrix3d(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);transform: matrix3d(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);}
  3.333333% { -webkit-transform: matrix3d(0.32778, 0, 0, 0, 0, 0.32778, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.32778, 0, 0, 0, 0, 0.32778, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  6.666667% { -webkit-transform: matrix3d(0.69875, 0, 0, 0, 0, 0.69875, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.69875, 0, 0, 0, 0, 0.69875, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  10% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  13.333333% { -webkit-transform: matrix3d(1.1815, 0, 0, 0, 0, 1.1815, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.1815, 0, 0, 0, 0, 1.1815, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  16.666667% { -webkit-transform: matrix3d(1.24402, 0, 0, 0, 0, 1.24402, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.24402, 0, 0, 0, 0, 1.24402, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  20% { -webkit-transform: matrix3d(1.21871, 0, 0, 0, 0, 1.21871, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.21871, 0, 0, 0, 0, 1.21871, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  23.333333% { -webkit-transform: matrix3d(1.14702, 0, 0, 0, 0, 1.14702, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.14702, 0, 0, 0, 0, 1.14702, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  26.666667% { -webkit-transform: matrix3d(1.06589, 0, 0, 0, 0, 1.06589, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.06589, 0, 0, 0, 0, 1.06589, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  30% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  33.333333% { -webkit-transform: matrix3d(0.9603, 0, 0, 0, 0, 0.9603, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.9603, 0, 0, 0, 0, 0.9603, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  36.666667% { -webkit-transform: matrix3d(0.94663, 0, 0, 0, 0, 0.94663, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.94663, 0, 0, 0, 0, 0.94663, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  40% { -webkit-transform: matrix3d(0.95217, 0, 0, 0, 0, 0.95217, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.95217, 0, 0, 0, 0, 0.95217, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  43.333333% { -webkit-transform: matrix3d(0.96784, 0, 0, 0, 0, 0.96784, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.96784, 0, 0, 0, 0, 0.96784, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  46.666667% { -webkit-transform: matrix3d(0.98559, 0, 0, 0, 0, 0.98559, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.98559, 0, 0, 0, 0, 0.98559, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  50% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  53.333333% { -webkit-transform: matrix3d(1.00868, 0, 0, 0, 0, 1.00868, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.00868, 0, 0, 0, 0, 1.00868, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  56.666667% { -webkit-transform: matrix3d(1.01167, 0, 0, 0, 0, 1.01167, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.01167, 0, 0, 0, 0, 1.01167, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  60% { -webkit-transform: matrix3d(1.01046, 0, 0, 0, 0, 1.01046, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.01046, 0, 0, 0, 0, 1.01046, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  63.333333% { -webkit-transform: matrix3d(1.00703, 0, 0, 0, 0, 1.00703, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.00703, 0, 0, 0, 0, 1.00703, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  66.666667% { -webkit-transform: matrix3d(1.00315, 0, 0, 0, 0, 1.00315, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.00315, 0, 0, 0, 0, 1.00315, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  70% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  73.333333% { -webkit-transform: matrix3d(0.9981, 0, 0, 0, 0, 0.9981, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.9981, 0, 0, 0, 0, 0.9981, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  76.666667% { -webkit-transform: matrix3d(0.99745, 0, 0, 0, 0, 0.99745, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.99745, 0, 0, 0, 0, 0.99745, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  80% { -webkit-transform: matrix3d(0.99771, 0, 0, 0, 0, 0.99771, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.99771, 0, 0, 0, 0, 0.99771, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  83.333333% { -webkit-transform: matrix3d(0.99846, 0, 0, 0, 0, 0.99846, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.99846, 0, 0, 0, 0, 0.99846, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  86.666667% { -webkit-transform: matrix3d(0.99931, 0, 0, 0, 0, 0.99931, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(0.99931, 0, 0, 0, 0, 0.99931, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  90% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  93.333333% { -webkit-transform: matrix3d(1.00042, 0, 0, 0, 0, 1.00042, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.00042, 0, 0, 0, 0, 1.00042, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  96.666667% { -webkit-transform: matrix3d(1.00056, 0, 0, 0, 0, 1.00056, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1.00056, 0, 0, 0, 0, 1.00056, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); }
  100% { -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1); transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);} 
}
</style>
