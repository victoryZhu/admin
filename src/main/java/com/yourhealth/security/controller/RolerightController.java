package com.yourhealth.security.controller;
 
import java.io.IOException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.yourhealth.common.service.ChbcUtils;
import com.yourhealth.foundation.domain.JqgridDataModel;
import com.yourhealth.foundation.domain.SpecificationByJqgridFilters;
import com.yourhealth.orgnization.domain.Ryxx;
import com.yourhealth.orgnization.service.RyxxService;
import com.yourhealth.security.domain.Authorization;
import com.yourhealth.security.domain.Role;
import com.yourhealth.security.domain.RoleRyxx;
import com.yourhealth.security.service.RoleFunctionService;
import com.yourhealth.security.service.RoleRyxxService;
import com.yourhealth.security.service.RoleService;

/**
 * 角色授权控制类
 * @author zzm
 *
 */
@Controller
@RequestMapping("/security/roleright")
@Transactional(propagation = Propagation.REQUIRED)
public class RolerightController {
	
	@Autowired
	private RoleService roleService = null;
	@Autowired
	private RyxxService ryxxService = null;
	@Autowired
	private RoleRyxxService roleRyxxService = null;
	@Autowired
	private RoleFunctionService roleFunctionService = null;
	@Autowired
	private ChbcUtils chbcUtils;
		
	/**
	 * 主框架
	 * @return
	 */
	@RequestMapping(method = RequestMethod.GET)
	@PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_USER')")
	public String main() {
		return "security/roleright/main";
	}
	
	/**
	 * 返回json格式角色信息列表
	 * @param pageable
	 * @param sortBy
	 * @param order
	 * @param search
	 * @param searchField
	 * @param searchOper
	 * @param searchString
	 * @param filters
	 * @return
	 * @throws Exception 
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_USER')")
	@RequestMapping(value = "/roles", method = RequestMethod.GET, produces = "application/json")
	@ResponseBody	
	public JqgridDataModel<Role> getRoles(
			Pageable pageable,
			@RequestParam(value = "sidx", defaultValue = "id", required = false) String sidx,
			@RequestParam(value = "sord", defaultValue = "desc", required = false) String sord,
			@RequestParam("_search") boolean search,
			@RequestParam(value = "searchField", required = false) String searchField,
			@RequestParam(value = "searchOper", required = false) String searchOper,
			@RequestParam(value = "searchString", required = false) String searchString,
			@RequestParam(value = "filters", required = false) String filters) throws Exception {
		//
		PageRequest pageRequest = (PageRequest) pageable.previousOrFirst();				
		if (!sidx.equals("") && !sord.equals("")) {
			Sort sort = chbcUtils.getSortBySidxAndSord(sidx, sord);
			pageRequest = new PageRequest(pageRequest.getPageNumber(), pageRequest.getPageSize(), sort);
		}	
		
		Specification<Role> spec = null;		
		if (search && filters != null) {			
			spec = new SpecificationByJqgridFilters<>(filters);
		}
		
		return new JqgridDataModel<>(roleService.findAll(spec, pageRequest));
	}

	/**
	 * 新增角色
	 * @param role
	 * @param bindingResult
	 * @return
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN')")
	@RequestMapping(value = "/role", method = RequestMethod.POST, produces = "application/json")
	@ResponseBody
	public Map<String, Object> addRole(@Valid Role role, BindingResult bindingResult) {
		
		Map<String, Object> model = new HashMap<String, Object>();
				
		role.setCreateTime(Calendar.getInstance());
				
		validateRoleCode("ADD", role, bindingResult);
		validateRoleName("ADD", role, bindingResult);		
		if (bindingResult.hasErrors()) {
			model.put("success", false);
			model.put("message", bindingResult.getFieldErrors());
			return model;
		}
		
		roleService.save(role);
		
		model.put("key_id", role.getId());
		model.put("success", true);
		model.put("message", "ok");
		return model;
	}
	
	/**
	 * 修改角色
	 * @param role
	 * @param bindingResult
	 * @return
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN')")
	@RequestMapping(value = "/role/{id}", method = RequestMethod.PUT)
	@ResponseBody
	public Map<String, Object> updRole(@Valid Role role, BindingResult bindingResult) {
		
		Map<String, Object> model = new HashMap<String, Object>();		
				
		validateRoleCode("UPD", role, bindingResult);
		validateRoleName("UPD",role, bindingResult);		
		
		if (bindingResult.hasErrors()) {
			model.put("success", false);
			model.put("message", bindingResult.getFieldErrors());			
			return model;
		}
		
		roleService.save(role);
		
		model.put("key_id", role.getId());
		model.put("success", true);
		model.put("message", "ok");
		return model;
	}
	
	/**
	 * 验证角色编号，编号不能重复
	 * @param role
	 * @param bindingResult
	 */
	private void validateRoleCode(String opeType, Role role,	BindingResult bindingResult) {
		if (roleService.checkRoleCode(opeType, role)) {
			bindingResult.rejectValue("roleCode", "validate.role.code.exist",
					"角色编号已经存在，请使用其他编号！");
		}
	}
	
	/**
	 * 验证角色名称，名称不能重复
	 * @param role
	 * @param bindingResult
	 */
	private void validateRoleName(String opeType, Role role, BindingResult bindingResult) {
		if (roleService.checkRoleName(opeType, role)) {
			bindingResult.rejectValue("roleName", "validate.role.name.exist",
					"角色名称已经存在，请使用其他名称！");
		}
	}

	/**
	 * 删除角色，JPA级联删除角色功能和角色人员
	 * @param req
	 * @param id
	 * @return
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN')")
	@ResponseBody
	@RequestMapping(value = "/role/{id}", method = RequestMethod.DELETE, produces = "application/json")
	public Map<String, Object> delRole(HttpServletRequest req, @PathVariable Integer id) {		
		Map<String, Object> model = new HashMap<String, Object>();
		roleService.delete(id);				
		model.put("success", true);
		model.put("message", "ok");		
		return model;		
	}
		
	/**
	 * 返回json格式角色人员列表
	 * @param pageable
	 * @param sortBy
	 * @param order
	 * @param id
	 * @return
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_USER')")
	@RequestMapping(value = "/ryxxs", method = RequestMethod.GET, produces = "application/json")
	@ResponseBody	
	public JqgridDataModel<RoleRyxx> getRyxxs(
			Pageable pageable,
			@RequestParam(value = "sidx", defaultValue = "code", required = false) String sidx,
			@RequestParam(value = "sord", defaultValue = "asc", required = false) String sord,
			@RequestParam(value = "roleid", required = true) Integer roleid) {
		
		//
		PageRequest pageRequest = (PageRequest) pageable.previousOrFirst();					
		if (!sidx.equals("") && !sord.equals("")) {
			Sort sort = chbcUtils.getSortBySidxAndSord(sidx, sord);
			pageRequest = new PageRequest(pageRequest.getPageNumber(), pageRequest.getPageSize(), sort);
		}	
		
		return new JqgridDataModel<>(roleRyxxService.findAllByRoleId(roleid, pageRequest));		
	}

	/**
	 * 新增角色成员，可以新增多个人员	
	 * @param roleId
	 * @param ryxxIds
	 * @return
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN')")
	@RequestMapping(value = "/roleryxxs", method = RequestMethod.POST, produces = "application/json")
	@ResponseBody			
	public Map<String, Object> addRoleRyxxs(@RequestParam(required = true) Integer roleId,
			@RequestParam(required = true) String ryxxIds) {
		Role role = roleService.findOne(roleId); 
		List<RoleRyxx> roleRyxxs = new ArrayList<RoleRyxx>();
						
		for(String ryxxid : ryxxIds.split(",")){			
			Ryxx ryxx = ryxxService.findOne(Integer.parseInt(ryxxid));			
			RoleRyxx roleRyxx = new RoleRyxx(); 			
			roleRyxx.setRole(role);
			roleRyxx.setRyxx(ryxx);		
			roleRyxxs.add(roleRyxx);			
		}
		roleRyxxs = roleRyxxService.save(roleRyxxs);		
		
		Map<String, Object> model = new HashMap<String, Object>();
		//可能会新增多个人员，返回第一个人员的key值。
		model.put("key_id", roleRyxxs.get(0).getId());
		model.put("success", true);
		model.put("message", "ok");
		return model;
	}
	
	/**
	 * 删除角色人员，可以删除多个角色人员（多个角色人员的id用逗号分隔）
	 * @param req
	 * @param ids
	 * @return
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN')")
	@ResponseBody
	@RequestMapping(value = "/roleryxx/{ids}", method = RequestMethod.DELETE, produces = "application/json")	
	public Map<String, Object> delRoleRyxx(HttpServletRequest req, @PathVariable String ids) {		
					
		for(String id : ids.split(",")){
			roleRyxxService.delete(Integer.parseInt(id));
		}		
		
		Map<String, Object> model = new HashMap<String, Object>();		
		model.put("success", true);
		model.put("message", "ok");		
		return model;		
	}	
		
	/**
	 * 取出系统模块功能，并标识角色已经授权的模块功能，用于管理员设定角色权限
	 * @param roleId
	 * @return
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN')")
	@RequestMapping(value = "/getrolefunction/{roleId}", method = RequestMethod.GET, produces = "application/json")
	@ResponseBody
	public JqgridDataModel<Authorization> getSysFuncs(@PathVariable Integer roleId) {		
		List<Authorization> list = roleService.getRoleFunctionTreeForEdit(roleId);	
		return new JqgridDataModel<Authorization>(list);
	}	
			
	/**
	 * 保存设置的角色功能
	 * @param roleId
	 * @param funcids
	 * @return
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN')")
	@RequestMapping(value = "/saverolefunction/{roleid}", method = RequestMethod.POST, produces = "application/json")	
	@ResponseBody
	public Map<String, Object> saveRoleFunctions(			
			@PathVariable(value = "roleid") Integer roleId,
			@RequestParam(value = "id[]", required = true) String[] id,
			@RequestParam(value = "idx[]", required = true) Integer[] idx) {				 
		Map<String, Object> model = new HashMap<String, Object>();		
		
		Role role = roleService.findOne(roleId);
		
		//删除角色原来的模块功能
		roleFunctionService.delRoleFunctions(roleId);
		
		//新增角色模块功能
		int i_len = id==null?0:id.length;
		if(i_len>0)
			roleFunctionService.save(role, idx);			
							
		model.put("success", true);
		model.put("message", "ok");
		return model;
	}		
	
	/**
	 * 权限浏览
	 * @param ryxxid
	 * @return
	 * @throws IOException 
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_USER')")
	@RequestMapping(value = "/jsqx/{roleId}", method = RequestMethod.GET)
	//@ResponseBody
	public String getRyqx(@PathVariable Integer roleId, HttpServletResponse response) throws IOException {
		String nodes = roleService.getRoleFunctionTreeForShow(roleId);		
		response.setContentType("application/json; charset=UTF-8");
		response.getWriter().print(nodes);
		return null;
	}
	
}