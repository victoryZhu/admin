package com.yourhealth.security.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Expression;
import javax.persistence.criteria.Path;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yourhealth.common.service.ChbcUtils;
import com.yourhealth.deploy.domain.Function;
import com.yourhealth.foundation.domain.JqgridDataModel;
import com.yourhealth.foundation.domain.JqgridFiltersModel;
import com.yourhealth.foundation.domain.JqgridFiltersRule;
import com.yourhealth.orgnization.domain.Ryxx;
import com.yourhealth.orgnization.service.RyxxService;
import com.yourhealth.security.domain.Authorization;
import com.yourhealth.security.domain.Role;
import com.yourhealth.security.domain.RoleRyxx;
import com.yourhealth.security.domain.RyxxFunction;
import com.yourhealth.security.service.RoleRyxxService;
import com.yourhealth.security.service.RoleService;
import com.yourhealth.security.service.RyxxFunctionService;

/**
 * 用户授权控制类
 * @author zzm
 *
 */
@Controller
@RequestMapping("/security/userright")
@Transactional(propagation = Propagation.REQUIRED)
public class UserrightController {
	
	@Autowired
	private RyxxService ryxxService = null;	
	@Autowired
	private final RyxxFunctionService ryxxFunctionService = null;
	@Autowired
	private RoleService roleService = null;
	@Autowired
	private RoleRyxxService roleRyxxService = null;
	@Autowired
	private ChbcUtils chbcUtils;
	
	/**
	 *  主框架
	 * @return
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_USER')")
	@RequestMapping(method = RequestMethod.GET)
	public String main(Map<String, Object> model) {		
		return "security/userright/main";
	}

	/**
	 * 在职员工信息列表
	 * @param pageable
	 * @param sidx
	 * @param sord
	 * @param search
	 * @param searchField
	 * @param searchOper
	 * @param searchString
	 * @param filters
	 * @return
	 * @throws Exception 
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_USER')")
	@RequestMapping(value = "/ryxxs", method = RequestMethod.GET, produces = "application/json")
	@ResponseBody
	public JqgridDataModel<Ryxx> getRyxxs(
			Pageable pageable,
			@RequestParam(value = "sidx", defaultValue = "id", required = false) String sidx,
			@RequestParam(value = "sord", defaultValue = "asc", required = false) String sord,
			@RequestParam("_search") boolean search,
			@RequestParam(value = "searchString", required = false) String searchString,
			@RequestParam(value = "filters", required = false) String filters) throws Exception {
		
		PageRequest pageRequest = (PageRequest) pageable.previousOrFirst();		
		if (!sidx.equals("") && !sord.equals("")) {
			Sort sort = chbcUtils.getSortBySidxAndSord(sidx, sord);
			pageRequest = new PageRequest(pageRequest.getPageNumber(), pageRequest.getPageSize(), sort);
		}	
		
		Specification<Ryxx> spec = getRyxxSpecification(filters);
			
		return new JqgridDataModel<>(ryxxService.findAll(spec, pageRequest));
	}
	
	private Specification<Ryxx> getRyxxSpecification(final String filters) throws JsonParseException, JsonMappingException, IOException {		
		
		return new Specification<Ryxx>() {	
			@SuppressWarnings("unchecked")
			@Override
			public Predicate toPredicate(Root<Ryxx> root, CriteriaQuery<?> query, CriteriaBuilder cb) {			
				if (filters != null) {
					ObjectMapper mapper = new ObjectMapper();
					JqgridFiltersModel criteria;
					try {
						criteria = mapper.readValue(filters, JqgridFiltersModel.class);
						String groupOp = criteria.groupOp;
						Predicate predicate = groupOp.equalsIgnoreCase("AND")? cb.conjunction():cb.disjunction();
						
						for (JqgridFiltersRule rule:criteria.rules) {
							String[] field = rule.field.split("\\.");
							Path<?> path = root;
							for (String f:field) {
								path = path.get(f);
							}
							switch(rule.op) {
								case "eq": {
									Predicate p = cb.equal(path, rule.data);
									predicate = groupOp.equalsIgnoreCase("AND")? cb.and(predicate,p):cb.or(predicate,p);
									break;
								}
								case "ne": {
									Predicate p = cb.notEqual(path, rule.data);
									predicate = groupOp.equalsIgnoreCase("AND")? cb.and(predicate,p):cb.or(predicate,p);
									break;
								}
								case "cn": {
									Predicate p = cb.like((Expression<String>)path, "%"+rule.data+"%");
									predicate = groupOp.equalsIgnoreCase("AND")? cb.and(predicate,p):cb.or(predicate,p);
									break;
								}
								case "nc": {
									Predicate p = cb.notLike((Expression<String>)path, "%"+rule.data+"%");
									predicate = groupOp.equalsIgnoreCase("AND")? cb.and(predicate,p):cb.or(predicate,p);
									break;
								}
							}				
						}
						
						Predicate p1 = cb.equal(root.get("employed").as(boolean.class), true);				
						predicate = cb.and(predicate, p1);
						return predicate;
					} catch (JsonParseException e) {						
						e.printStackTrace();
						return null;
					} catch (JsonMappingException e) {
						e.printStackTrace();
						return null;
					} catch (IOException e) {
						e.printStackTrace();
						return null;
					}					
				}else{
					Predicate p1 = cb.equal(root.get("employed").as(boolean.class), true);				
					Predicate predicate = cb.and(p1);
					return predicate;
				}				
			}			
		};	
	}
		
	/**
	 * 取出系统模块功能，并标识用户已经授权的模块功能，用于管理员设定用户权限
	 * @param ryxxid
	 * @return
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN')")
	@RequestMapping(value = "/getuserfunction/{ryxxid}", method = RequestMethod.GET, produces = "application/json")
	@ResponseBody
	public JqgridDataModel<Authorization> getSysFuncs(@PathVariable Integer ryxxid) {
		List<Authorization> list = ryxxService.getRyxxFunctionTreeForEdit(ryxxid);
		return new JqgridDataModel<Authorization>(list);
	}

	/**
	 * 设定保存权限
	 * @param ryxxid
	 * @param id
	 * @return
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN')")
	@RequestMapping(value = "/saveuserfunction/{ryxxid}", method = RequestMethod.POST, produces = "application/json")
	@ResponseBody
	public Map<String, Object> setRyqx(@PathVariable Integer ryxxid,			
			@RequestParam(value = "id[]", required = true) String[] id,
			@RequestParam(value = "idx[]", required = true) String[] idx) {
				
		Ryxx ryxx = ryxxService.findOne(ryxxid);
		ryxxFunctionService.delRyxxFunction(ryxx);
		
		int i_len = id == null ? 0 : id.length;
		for (int i = 0; i < i_len; i++) {
			Function function = new Function();
			function.setId(Integer.parseInt(idx[i]));

			RyxxFunction ryxxFunction = new RyxxFunction();			
			ryxxFunction.setRyxx(ryxx);
			ryxxFunction.setFunction(function);
			ryxxFunctionService.save(ryxxFunction);
		}

		Map<String, Object> model = new HashMap<String, Object>();
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
	@RequestMapping(value = "/ryqx/{ryxxid}", method = RequestMethod.GET)
	//@ResponseBody
	public String getRyqx(@PathVariable Integer ryxxid, HttpServletRequest request,HttpServletResponse response) throws IOException {
		String nodes = ryxxService.getRyxxFunctionTreeForShow(ryxxid);		
		response.setContentType("application/json; charset=UTF-8");
		response.getWriter().print(nodes);
		return null;
	}
	
	/**
	 * 人员角色列表
	 * @param sortBy
	 * @param order
	 * @param ryxxid
	 * @return
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_USER')")
	@RequestMapping(value = "/ryxxroles", method = RequestMethod.GET, produces = "application/json")
	@ResponseBody
	public JqgridDataModel<RoleRyxx> getRoleRyxxs(
			Pageable pageable,
			@RequestParam(value = "sidx", defaultValue = "id", required = false) String sidx,
			@RequestParam(value = "sord", defaultValue = "asc", required = false) String sord,
			@RequestParam(value = "ryxxid", required = true) Integer ryxxId) {
		
		PageRequest pageRequest = (PageRequest) pageable.previousOrFirst();		
		if (!sidx.equals("") && !sord.equals("")) {
			Sort sort = chbcUtils.getSortBySidxAndSord(sidx, sord);
			pageRequest = new PageRequest(pageRequest.getPageNumber(), pageRequest.getPageSize(), sort);
		}

		return new JqgridDataModel<>(roleRyxxService.findAllByRyxxId(ryxxId, pageRequest));
	}
	
	/**
	 * 增加人员角色
	 * @param ryxxid
	 * @param roleids
	 * @return
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN')")
	@RequestMapping(value = "/ryxxroles", method = RequestMethod.POST, produces = "application/json")
	@ResponseBody
	public Map<String, Object> addRoleRyxx(
			@RequestParam(value = "ryxxid", required = true) Integer ryxxid,
			@RequestParam(value = "roleids", required = true) String roleids) {
		Map<String, Object> model = new HashMap<String, Object>();
				
		Ryxx ryxx = ryxxService.findOne(ryxxid);
			
		String[] roleid = roleids.split(",");
		for (int i = 0; i < roleid.length; i++) {
			Role role = roleService.findOne(Integer.parseInt(roleid[i]));
			
			RoleRyxx roleRyxx = new RoleRyxx();
			roleRyxx.setRole(role);
			roleRyxx.setRyxx(ryxx);
			roleRyxxService.save(roleRyxx);
		}

		model.put("success", true);
		model.put("message", "ok");
		return model;
	}

	/**
	 * 删除人员角色
	 * @param ryxxid
	 * @param roleryxxIds
	 * @return
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN')")
	@ResponseBody
	@RequestMapping(value = "/ryxxroles/{ryxxid}/{roleryxxIds}", method = RequestMethod.DELETE, produces = "application/json")
	public Map<String, Object> delRoleRyxx(@PathVariable String ryxxid, @PathVariable String roleryxxIds) {
		Map<String, Object> model = new HashMap<String, Object>();
		//循环删除
		for (String tempId : roleryxxIds.split(",")) {
			roleRyxxService.delete(Integer.parseInt(tempId));
		}
		model.put("success", true);
		model.put("message", "ok");
		return model;
	}
	
}
