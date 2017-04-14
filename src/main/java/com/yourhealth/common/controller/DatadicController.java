package com.yourhealth.common.controller;
 
import java.util.HashMap;
import java.util.Map;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.validation.Valid;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.yourhealth.common.domain.DictionaryItem;
import com.yourhealth.common.domain.DictionaryValue;
import com.yourhealth.common.service.ChbcUtils;
import com.yourhealth.common.service.DictionaryItemService;
import com.yourhealth.common.service.DictionaryValueService;
import com.yourhealth.foundation.domain.JqgridDataModel;
import com.yourhealth.foundation.domain.SpecificationByJqgridFilters;

/**
 * 数据字典控制类
 * @author zzm
 *
 */
@Controller
@RequestMapping("/common/dictionary")
public class DatadicController {

	@Autowired
	private DictionaryItemService dictionaryItemService = null;
	@Autowired
	private DictionaryValueService dictionaryValueService = null;	
	@Autowired
	private ChbcUtils chbcUtils;

	/**
	 * 主框架
	 * @param httpSession
	 * @param clear
	 * @param model
	 * @return
	 */	@RequestMapping(method = RequestMethod.GET)
	@PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_USER')")
	public String main(HttpSession httpSession,
			@RequestParam(value = "clear", defaultValue = "true") String clear,
			Map<String, Object> model) {
		return "common/dictionary/main";
	}
	
	/**
	 * 返回分页数据字典列表，json格式数据的方式
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
	@RequestMapping(value = "/item", method = RequestMethod.GET, produces = "application/json")
	@ResponseBody
	public JqgridDataModel<DictionaryItem> getDictionaryItems(
			Pageable pageable,
			@RequestParam(value = "sidx", defaultValue = "id", required = false) String sidx,      //排序字段
			@RequestParam(value = "sord", defaultValue = "desc", required = false) String sord,    //排序方式
			@RequestParam("_search") boolean search,                                               //是否查询
			@RequestParam(value = "searchString", required = false) String searchString,           //模糊查询条件
			@RequestParam(value = "filters", required = false) String filters) throws Exception {  //查询条件		
		
		System.out.println("search="+search);
		System.out.println("searchString="+searchString);
		System.out.println("filters="+filters);
		
		//生成翻页对象
		PageRequest pageRequest = (PageRequest) pageable.previousOrFirst();		
		if (!sidx.equals("") && !sord.equals("")) {
			Sort sort = chbcUtils.getSortBySidxAndSord(sidx, sord);
			pageRequest = new PageRequest(pageRequest.getPageNumber(), pageRequest.getPageSize(), sort);
		}	
		
		//
		Specification<DictionaryItem> spec = null;
		if (search) {			
			if (searchString != null && !"".equals(searchString.trim())) {
				//模糊查询，根据searchString与各个栏位匹配
				spec = getSpecificationByFuzzySearch(searchString);
			} else if (filters != null) {
				spec = new SpecificationByJqgridFilters<>(filters);
			} 
		}
		
		return new JqgridDataModel<>(dictionaryItemService.findAll(spec, pageRequest));		
	}	

	private Specification<DictionaryItem> getSpecificationByFuzzySearch(String searchString) {
		final String criteria = searchString;
		return new Specification<DictionaryItem>() {	
			@Override
			public Predicate toPredicate(Root<DictionaryItem> root,	CriteriaQuery<?> query, CriteriaBuilder cb) {
				Predicate p1 = cb.like(root.get("code").as(String.class), "%"+criteria+"%");
				Predicate p2 = cb.like(root.get("name").as(String.class), "%"+criteria+"%");
				Predicate predicate = cb.or(p1, p2);
				return predicate;
			}			
		};	
	}

	/**
	 * 修改数据字典项
	 * @param dictionaryItem
	 * @param bindingResult
	 * @return
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN')")
	@RequestMapping(value = "/item/{id}", method = RequestMethod.PUT)
	@ResponseBody
	public Map<String, Object> updDictionaryItem(@Valid DictionaryItem dictionaryItem, BindingResult bindingResult) {
		Map<String, Object> model = new HashMap<String, Object>();
		model.put("key_id", dictionaryItem.getId());
		validateDictionaryItemName(dictionaryItem, bindingResult);
		if (bindingResult.hasErrors()) {
			model.put("success", false);
			model.put("message", bindingResult.getFieldErrors());
			return model;
		}

		dictionaryItemService.save(dictionaryItem);
		model.put("success", true);
		model.put("message", "ok");
		return model;
	}

	/**
	 * 检验数据字典项逻辑名不可重复
	 * @param dictionaryItem
	 * @param bindingResult
	 */
	private void validateDictionaryItemName(DictionaryItem dictionaryItem,
			BindingResult bindingResult) {
		if (dictionaryItemService.chkItemName(dictionaryItem)) {
			bindingResult.rejectValue("name", "validate.dictionaryItem.name.repeat",
					"数据字典项逻辑名不可重复，请重新输入！");
		}
	}

	/**
	 * 返回数据字典值列表，json格式数据的方式
	 * @param httpSession
	 * @param page
	 * @param rows
	 * @param sortBy
	 * @param order
	 * @param id
	 * @return
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_USER')")
	@RequestMapping(value = "/value", method = RequestMethod.GET, produces = "application/json")
	@ResponseBody
	public JqgridDataModel<DictionaryValue> getDictionaryValues(
			Pageable pageable,
			@RequestParam(value = "sidx", defaultValue = "code", required = false) String sidx,
			@RequestParam(value = "sord", defaultValue = "asc", required = false) String sord,
			@RequestParam(value = "id", required = true) int id) {
		PageRequest pageRequest = (PageRequest) pageable.previousOrFirst();	
		
		if (!sidx.equals("") && !sord.equals("")) {
			Sort sort = chbcUtils.getSortBySidxAndSord(sidx, sord);
			pageRequest = new PageRequest(pageRequest.getPageNumber(), pageRequest.getPageSize(), sort);
		}
		
		return new JqgridDataModel<>(dictionaryValueService.findByDictionaryItem_Id(id, pageRequest));
	}

	/**
	 * 新增数据字典值－保存
	 * @param dictionaryValue
	 * @param bindingResult
	 * @return
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN')")
	@RequestMapping(value = "/value", method = RequestMethod.POST, produces = "application/json")	    
	@ResponseBody		  
	public Map<String, Object> addDicmx(@Valid DictionaryValue dictionaryValue,
			BindingResult bindingResult) {
		Map<String, Object> model = new HashMap<String, Object>();

		validateDictionaryValueCode("ADD", dictionaryValue, bindingResult);
		validateDictionaryValueValue("ADD", dictionaryValue, bindingResult);
		
		if (bindingResult.hasErrors()) {
			model.put("success", false);
			model.put("message", bindingResult.getFieldErrors());	
			System.out.println("error : " + bindingResult.getFieldErrors());
			return model;
		}
		dictionaryValueService.save(dictionaryValue);
		
		model.put("success", true);
		model.put("message", "ok");
		return model;
	}

	/**
	 * 修改数据字典值－保存
	 * @param dictionaryValue
	 * @param bindingResult
	 * @return
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN')")
	@RequestMapping(value = "/value/{id}", method = RequestMethod.PUT, produces = "application/json")	
	@ResponseBody
	public Map<String, Object> updDicmx(@Valid DictionaryValue dictionaryValue,
			BindingResult bindingResult) { 
		Map<String, Object> model = new HashMap<String, Object>();
		model.put("key_id", dictionaryValue.getId());

		validateDictionaryValueCode("UPD", dictionaryValue, bindingResult);
		validateDictionaryValueValue("UPD", dictionaryValue, bindingResult);
		if (bindingResult.hasErrors()) {
			model.put("success", false);
			model.put("message", bindingResult.getFieldErrors());
			return model;
		}
		dictionaryValueService.save(dictionaryValue);
		model.put("success", true);
		model.put("message", "ok");
		return model;
	}

	/**
	 * 检验数据字典值不可重复
	 * @param opeType 
	 * @param dictionaryValue
	 * @param bindingResult
	 */
	private void validateDictionaryValueValue(String opeType, DictionaryValue dictionaryValue,
			BindingResult bindingResult) {
		if (dictionaryValueService.chkDictionaryValueValue(opeType, dictionaryValue)) {
			bindingResult.rejectValue("value", "validate.dictionaryValue.value.repeat", "数据字典值不可重复，请重新输入！");
		}
	}

	/**
	 * 检验数据字典编号不可重复
	 * @param opeType 
	 * @param dictionaryValue
	 * @param bindingResult
	 */
	private void validateDictionaryValueCode(String opeType, DictionaryValue dictionaryValue,
			BindingResult bindingResult) {
		if (dictionaryValueService.chkDictionaryValueCode(opeType, dictionaryValue)) {
			bindingResult.rejectValue("code", "validate.dictionaryValue.code.repeat", "数据字典编号不可重复，请重新输入！");
		}
	}

	/**
	 * 删除数据字典值
	 * @param id
	 * @return
	 */
	@PreAuthorize("hasAnyRole('ROLE_ADMIN')")
	@RequestMapping(value = "/value/{id}", method = RequestMethod.DELETE, produces = "application/json")
	@ResponseBody
	public Map<String, Object> delDicmx(@PathVariable int id) {		
		Map<String, Object> model = new HashMap<String, Object>();		
		dictionaryValueService.delete(id);		
		model.put("key_id", id);
		model.put("success", true);
		model.put("message", "ok");
		return model;
	}
       
}